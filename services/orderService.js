const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Address = require("../models/Address");

class OrderService {
  async createOrder(orderData) {
    const { items, shippingAddress, userId } = orderData;

    // Validate and enrich items with product data
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        // Try to find product by MongoDB _id or custom id field
        let product;
        const productIdentifier = item.productId || item.id;

        // Check if it's a valid MongoDB ObjectId (24 hex characters)
        if (productIdentifier && productIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
          product = await Product.findById(productIdentifier);
        } else {
          // It's a custom id field, search by it
          product = await Product.findOne({ id: productIdentifier });
        }

        if (!product) {
          throw new Error(`Product not found: ${productIdentifier}`);
        }

        if (product.stock < item.qty) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }

        const price = product.price * (1 - product.discount / 100);
        const subtotal = price * item.qty;

        return {
          product: product._id,
          productSnapshot: {
            id: product.id,
            title: product.title,
            slug: product.slug,
            thumbnail: product.thumbnail,
            price: product.price,
            discount: product.discount,
            category: product.category,
          },
          quantity: item.qty,
          price: price,
          subtotal: subtotal,
        };
      })
    );

    // Calculate totals
    const subtotal = enrichedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    //const tax = subtotal * 0.075; // 7.5% VAT
    const tax = 0; // No tax for now
    const shippingCost = 0; // No shipping cost for now, it will be negotiated after payment
    //const shippingCost = subtotal > 5000000 ? 0 : 4000; // Free shipping over ₦5,000,000
    const total = subtotal + tax + shippingCost;

    // Create order
    const orderObj = {
      items: enrichedItems,
      shippingAddress: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        contact: shippingAddress.contact,
        address: shippingAddress.address,
        state: shippingAddress.state,
        country: shippingAddress.country,
      },
      subtotal,
      tax,
      shippingCost,
      total,
      status: "pending",
      paymentStatus: "pending",
    };

    // Associate with user if userId provided
    if (userId) {
      orderObj.user = userId;

      // Save shipping address to user's addresses for future reference
      try {
        const user = await User.findById(userId);
        if (user) {
          // Check if this address already exists
          const existingAddresses = await Address.find({
            _id: { $in: user.addresses },
          });
          const addressExists = existingAddresses.some(
            (addr) =>
              addr.name === shippingAddress.name &&
              addr.address === shippingAddress.address &&
              addr.contact === shippingAddress.contact
          );

          if (!addressExists) {
            // Create new address
            const newAddress = await Address.create({
              name: shippingAddress.name,
              email: shippingAddress.email,
              contact: shippingAddress.contact,
              address: shippingAddress.address,
              state: shippingAddress.state,
              country: shippingAddress.country,
            });

            // Add to user's addresses
            user.addresses.push(newAddress._id);
            await user.save();
          }
        }
      } catch (error) {
        console.error("Failed to save address to user profile:", error);
        // Don't fail order creation if address save fails
      }
    } else {
      console.log("No userId provided - creating order as guest");
    }

    const order = new Order(orderObj);

    await order.save();

    // Update product stock
  /*   await Promise.all(
      enrichedItems.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        })
      })
    ); */

    return order;
  }

  async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate("items.product", "title slug thumbnail price discount")
      .lean();
    return order;
  }

  async getOrderByOrderNumber(orderNumber) {
    const order = await Order.findOne({ orderNumber })
      .populate("items.product", "title slug thumbnail price discount")
      .lean();
    return order;
  }

  async getUserOrders(userId, filters = {}) {
    const query = { user: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("items.product", "title slug thumbnail price discount")
      .lean();

    return orders;
  }

  async getAllOrdersWithPagination(options = {}) {
    const { skip = 0, limit = 10 } = options;
    const query = {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "title slug thumbnail price discount")
        .lean(),
      Order.countDocuments(query),
    ]);
    return { orders, total };
  }

  async getUserOrdersWithPagination(userId, options = {}) {
    const { skip = 0, limit = 10, status } = options;
    const query = { user: userId };

    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "title slug thumbnail price discount")
        .lean(),
      Order.countDocuments(query),
    ]);

    return { orders, total };
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );
    return order;
  }

  async markInvoiceSent(orderId) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        invoiceSent: true,
        invoiceSentAt: new Date(),
      },
      { new: true }
    );
    return order;
  }
}

module.exports = new OrderService();
