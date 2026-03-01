import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Core types
  public type ProductCategory = {
    #home;
    #shop;
    #car;
  };

  public type OrderStatus = {
    #pending;
    #awaitingPayment;
    #paid;
    #confirmed;
    #delivered;
    #cancelled;
  };

  public type PaymentMethod = {
    #cod;
    #paymentLink;
  };

  public type UserRole = {
    #customer;
    #admin;
    #superAdmin;
  };

  public type User = {
    principal : Principal;
    role : UserRole;
    name : Text;
    phone : Text;
    isBlocked : Bool;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    role : UserRole;
    isBlocked : Bool;
  };

  public type Product = {
    id : Nat;
    name : Text;
    category : ProductCategory;
    price : Nat;
    description : Text;
    image : Storage.ExternalBlob;
    stock : Nat;
    isActive : Bool;
    createdAt : Int;
  };

  public type OrderItem = {
    productId : Nat;
    qty : Nat;
    price : Nat;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    deliveryDate : Int;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    addressLine : Text;
    pincode : Text;
    createdAt : Int;
  };

  public type Subscription = {
    id : Nat;
    userId : Principal;
    productId : Nat;
    qty : Nat;
    orderIds : [Nat];
    isPaused : Bool;
    isCancelled : Bool;
    createdAt : Int;
    addressLine : Text;
    pincode : Text;
    phone : Text;
  };

  public type CMSTagline = {
    tagline : Text;
    popupText : Text;
    popupActive : Bool;
    festivalOffer : Text;
  };

  public type CMSTerms = {
    termsAndConditions : Text;
    privacyPolicy : Text;
    refundPolicy : Text;
    shippingPolicy : Text;
  };

  public type CMSSEO = {
    seoTitle : Text;
    seoMeta : Text;
  };

  public type CMSContent = {
    tagline : CMSTagline;
    terms : CMSTerms;
    seo : CMSSEO;
  };

  public type DeliverySettings = {
    allowedPincodes : [Text];
    minOrderValue : Nat;
    isOrderFreezeActive : Bool;
  };

  public type ProductInput = {
    name : Text;
    category : ProductCategory;
    price : Nat;
    description : Text;
    image : Storage.ExternalBlob;
    stock : Nat;
    isActive : Bool;
  };

  public type DashboardStats = {
    totalOrders : Nat;
    dailyRevenue : Nat;
    weeklyRevenue : Nat;
    monthlyRevenue : Nat;
    subscriptionRevenue : Nat;
  };

  // State
  let users = Map.empty<Principal, User>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let subscriptions = Map.empty<Nat, Subscription>();

  var nextProductId : Nat = 0;
  var nextOrderId : Nat = 0;
  var nextSubscriptionId : Nat = 0;

  var cmsContent : CMSContent = {
    tagline = {
      tagline = "";
      popupText = "";
      popupActive = false;
      festivalOffer = "";
    };
    terms = {
      termsAndConditions = "";
      privacyPolicy = "";
      refundPolicy = "";
      shippingPolicy = "";
    };
    seo = {
      seoTitle = "";
      seoMeta = "";
    };
  };

  var deliverySettings : DeliverySettings = {
    allowedPincodes = [];
    minOrderValue = 0;
    isOrderFreezeActive = false;
  };

  // External Blob Storage
  include MixinStorage();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper functions - using persistent users Map
  func isRegisteredUser(caller : Principal) : Bool {
    not caller.isAnonymous() and users.get(caller) != null;
  };

  func mapRoleToAccessControl(role : UserRole) : AccessControl.UserRole {
    switch (role) {
      case (#customer) { #user };
      case (#admin) { #admin };
      case (#superAdmin) { #admin };
    };
  };

  func isSuperAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (?user) { user.role == #superAdmin };
      case (null) { false };
    };
  };

  func isAdminOrSuperAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (?user) { user.role == #admin or user.role == #superAdmin };
      case (null) { false };
    };
  };

  func calculateNextSaturday() : Int {
    let now = Time.now();
    let nowSeconds = now / 1_000_000_000;
    let dayInSeconds : Int = 86400;
    let currentDayOfWeek = (nowSeconds / dayInSeconds + 4) % 7; // 0 = Sunday, 6 = Saturday
    let daysUntilSaturday = (6 - currentDayOfWeek + 7) % 7;
    let nextSaturdaySeconds = if (daysUntilSaturday == 0) {
      nowSeconds + 7 * dayInSeconds;
    } else {
      nowSeconds + daysUntilSaturday * dayInSeconds;
    };
    nextSaturdaySeconds * 1_000_000_000;
  };

  // User Profile Functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view profiles");
    };
    switch (users.get(caller)) {
      case (?user) {
        ?{
          name = user.name;
          phone = user.phone;
          role = user.role;
          isBlocked = user.isBlocked;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    switch (users.get(user)) {
      case (?u) {
        ?{
          name = u.name;
          phone = u.phone;
          role = u.role;
          isBlocked = u.isBlocked;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can save profiles");
    };
    switch (users.get(caller)) {
      case (?user) {
        let updatedUser = {
          user with
          name = profile.name;
          phone = profile.phone;
        };
        users.add(caller, updatedUser);
      };
      case (null) {
        Runtime.trap("User not found");
      };
    };
  };

  // User functions
  public shared ({ caller }) func registerOrLogin(name : Text, phone : Text) : async User {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot register or login");
    };
    switch (users.get(caller)) {
      case (?user) {
        if (user.isBlocked) {
          Runtime.trap("User is blocked");
        };
        user;
      };
      case (null) {
        let newUser = {
          principal = caller;
          role = #customer;
          name;
          phone;
          isBlocked = false;
          createdAt = Time.now();
        };
        users.add(caller, newUser);
        accessControlState.userRoles.add(caller, #user);
        newUser;
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async User {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view profile");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
  };

  public shared ({ caller }) func updateMyProfile(name : Text, phone : Text) : async User {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can update profile");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.isBlocked) {
          Runtime.trap("User is blocked");
        };
        let updatedUser = {
          user with name;
          phone;
        };
        users.add(caller, updatedUser);
        updatedUser;
      };
    };
  };

  public shared ({ caller }) func setUserRole(userPrincipal : Principal, newRole : UserRole) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only SUPER_ADMIN can set user roles");
    };
    switch (users.get(userPrincipal)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = {
          user with role = newRole;
        };
        users.add(userPrincipal, updatedUser);
        // Update AccessControl role
        let acRole = mapRoleToAccessControl(newRole);
        AccessControl.assignRole(accessControlState, caller, userPrincipal, acRole);
      };
    };
  };

  public shared ({ caller }) func blockUser(userPrincipal : Principal) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can block users");
    };
    switch (users.get(userPrincipal)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = {
          user with isBlocked = true;
        };
        users.add(userPrincipal, updatedUser);
      };
    };
  };

  public shared ({ caller }) func unblockUser(userPrincipal : Principal) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can unblock users");
    };
    switch (users.get(userPrincipal)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = {
          user with isBlocked = false;
        };
        users.add(userPrincipal, updatedUser);
      };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [User] {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    users.values().toArray();
  };

  // Product functions
  module Product {
    public func compareByCreatedAt(p1 : Product, p2 : Product) : Order.Order {
      Int.compare(p2.createdAt, p1.createdAt);
    };
  };

  public shared ({ caller }) func addProduct(productInput : ProductInput) : async Product {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let newProduct : Product = {
      id = productId;
      name = productInput.name;
      category = productInput.category;
      price = productInput.price;
      description = productInput.description;
      image = productInput.image;
      stock = productInput.stock;
      isActive = productInput.isActive;
      createdAt = Time.now();
    };

    products.add(productId, newProduct);
    newProduct;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, productInput : ProductInput) : async Product {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct = {
          existingProduct with
          name = productInput.name;
          category = productInput.category;
          price = productInput.price;
          description = productInput.description;
          image = productInput.image;
          stock = productInput.stock;
          isActive = productInput.isActive;
        };
        products.add(productId, updatedProduct);
        updatedProduct;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(productId);
      };
    };
  };

  public query func getProducts() : async [Product] {
    products.values().toArray().sort(Product.compareByCreatedAt);
  };

  public query func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Order functions
  public shared ({ caller }) func placeOrder(
    items : [OrderItem],
    deliveryDate : Int,
    paymentMethod : PaymentMethod,
    addressLine : Text,
    pincode : Text
  ) : async Order {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can place orders");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.isBlocked) {
          Runtime.trap("User is blocked");
        };

        let orderId = nextOrderId;
        nextOrderId += 1;

        let newOrder : Order = {
          id = orderId;
          userId = caller;
          items;
          deliveryDate;
          paymentMethod;
          status = #pending;
          addressLine;
          pincode;
          createdAt = Time.now();
        };

        orders.add(orderId, newOrder);
        newOrder;
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view orders");
    };
    orders.values().filter(func(o : Order) : Bool { o.userId == caller }).toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async Order {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with status;
        };
        orders.add(orderId, updatedOrder);
        updatedOrder;
      };
    };
  };

  public shared ({ caller }) func markPaymentPaid(orderId : Nat) : async Order {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can mark payment as paid");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with status = #paid;
        };
        orders.add(orderId, updatedOrder);
        updatedOrder;
      };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.userId != caller and not isAdminOrSuperAdmin(caller)) {
          Runtime.trap("Unauthorized: Can only cancel your own orders");
        };

        let updatedOrder = {
          order with status = #cancelled;
        };
        orders.add(orderId, updatedOrder);
        updatedOrder;
      };
    };
  };

  // Subscription functions
  public shared ({ caller }) func createSubscription(
    productId : Nat,
    qty : Nat,
    addressLine : Text,
    pincode : Text,
    phone : Text,
  ) : async Subscription {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can create subscriptions");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.isBlocked) {
          Runtime.trap("User is blocked");
        };

        let subscriptionId = nextSubscriptionId;
        nextSubscriptionId += 1;

        let newSubscription : Subscription = {
          id = subscriptionId;
          userId = caller;
          productId;
          qty;
          orderIds = [];
          isPaused = false;
          isCancelled = false;
          createdAt = Time.now();
          addressLine;
          pincode;
          phone;
        };

        subscriptions.add(subscriptionId, newSubscription);
        newSubscription;
      };
    };
  };

  public query ({ caller }) func getMySubscriptions() : async [Subscription] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view subscriptions");
    };
    subscriptions.values().filter(func(s : Subscription) : Bool { s.userId == caller }).toArray();
  };

  public query ({ caller }) func getAllSubscriptions() : async [Subscription] {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all subscriptions");
    };
    subscriptions.values().toArray();
  };

  public shared ({ caller }) func pauseSubscription(subscriptionId : Nat) : async Subscription {
    switch (subscriptions.get(subscriptionId)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?subscription) {
        if (subscription.userId != caller and not isAdminOrSuperAdmin(caller)) {
          Runtime.trap("Unauthorized: Can only pause your own subscriptions");
        };

        let updatedSubscription = {
          subscription with isPaused = true;
        };
        subscriptions.add(subscriptionId, updatedSubscription);
        updatedSubscription;
      };
    };
  };

  public shared ({ caller }) func cancelSubscription(subscriptionId : Nat) : async Subscription {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can cancel subscriptions");
    };

    switch (subscriptions.get(subscriptionId)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?subscription) {
        let updatedSubscription = {
          subscription with isCancelled = true;
        };
        subscriptions.add(subscriptionId, updatedSubscription);
        updatedSubscription;
      };
    };
  };

  // CMS functions
  public query func getCMSContent() : async CMSContent {
    cmsContent;
  };

  public shared ({ caller }) func updateCMSContent(tagline : CMSTagline, terms : CMSTerms, seo : CMSSEO) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update CMS content");
    };
    cmsContent := { tagline; terms; seo };
  };

  // Delivery Settings functions
  public query func getDeliverySettings() : async DeliverySettings {
    deliverySettings;
  };

  public shared ({ caller }) func updateDeliverySettings(settings : DeliverySettings) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update delivery settings");
    };
    deliverySettings := settings;
  };

  // Dashboard Stats
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let now = Time.now();
    let dayInNanos : Int = 86400_000_000_000;
    let weekInNanos : Int = 7 * dayInNanos;
    let monthInNanos : Int = 30 * dayInNanos;

    var dailyRevenue : Nat = 0;
    var weeklyRevenue : Nat = 0;
    var monthlyRevenue : Nat = 0;

    for (order in orders.values()) {
      let orderTotal = order.items.foldLeft(
        0,
        func(acc, item) { acc + item.price * item.qty }
      );

      if (order.createdAt >= now - dayInNanos) {
        dailyRevenue += orderTotal;
      };
      if (order.createdAt >= now - weekInNanos) {
        weeklyRevenue += orderTotal;
      };
      if (order.createdAt >= now - monthInNanos) {
        monthlyRevenue += orderTotal;
      };
    };

    {
      totalOrders = orders.size();
      dailyRevenue;
      weeklyRevenue;
      monthlyRevenue;
      subscriptionRevenue = 0;
    };
  };

  // Utility function
  public query func getNextSaturday() : async Int {
    calculateNextSaturday();
  };

  // Admin bootstrap system
  public query func hasNoAdmin() : async Bool {
    let hasAdmin = users.values().any(
      func(u) {
        u.role == #admin or u.role == #superAdmin;
      }
    );
    not hasAdmin;
  };

  /// Register caller as SUPER_ADMIN and admin - only works when no admin exists
  /// If caller already has a user entry, upgrades it to superAdmin (preserving createdAt)
  public shared ({ caller }) func claimFirstAdmin(name : Text, phone : Text) : async User {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot create admin account. Please use logged-in Internet Identity after key generation.");
    };

    // CRITICAL: Check that no admin exists before allowing claim
    let hasAdmin = users.values().any(
      func(u) {
        u.role == #admin or u.role == #superAdmin;
      }
    );
    if (hasAdmin) {
      Runtime.trap("Admin already exists. Cannot claim first admin privileges.");
    };

    // Check if caller already has a user entry (e.g., registered as customer first)
    let updatedUser = switch (users.get(caller)) {
      case (?existingUser) {
        // Upgrade existing user to superAdmin, preserving createdAt
        {
          principal = caller;
          role = #superAdmin : UserRole;
          name = name; // Update name if provided
          phone = phone; // Update phone if provided
          isBlocked = false;
          createdAt = existingUser.createdAt; // Preserve original createdAt
        };
      };
      case (null) {
        // Create new superAdmin user
        {
          principal = caller;
          role = #superAdmin : UserRole;
          name;
          phone;
          isBlocked = false;
          createdAt = Time.now();
        };
      };
    };

    users.add(caller, updatedUser);
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    updatedUser;
  };
};
