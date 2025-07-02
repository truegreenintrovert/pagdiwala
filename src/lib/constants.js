
export const POLICIES = {
  terms: {
    title: "Terms and Conditions",
    content: `
      1. Introduction
         - Welcome to Pagdiwala
         - By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions

      2. Services
         - Pagdiwala offers turban rentals and sales for weddings and special occasions
         - All rentals are subject to availability and specific terms mentioned at the time of booking

      3. Rental Policy
         - Rented turbans must be returned in the same condition as received
         - Any damage or loss will result in additional charges as per our assessment
         - Rental duration and return timelines must be strictly followed

      4. Purchase Policy
         - All turbans sold are of high-quality material, and no returns will be accepted once used
         - Customers must check product details before placing an order

      5. Pricing & Payment
         - Prices are subject to change without prior notice
         - Payments must be made in full before shipping or rental confirmation

      6. Liability
         - Pagdiwala is not responsible for any allergic reactions or discomfort caused by the turbans
         - Customers are advised to check materials before use

      7. Governing Law
         - These terms shall be governed by the laws of India
    `
  },
  privacy: {
    title: "Privacy Policy",
    content: `
      1. Data Collection
         - We collect personal information such as name, contact details, and payment information
         - Information is collected to process orders and rentals
         - Data collection is essential for service delivery

      2. Data Usage
         - Information is used for order fulfillment, customer support, and promotional communication
         - We do not sell or share personal data with third parties
         - Exceptions only for order processing and legal requirements

      3. Data Security
         - We use secure systems to protect customer data
         - Protection against unauthorized access or disclosure
         - Regular security updates and monitoring

      4. Customer Rights
         - Customers can request data deletion or modification
         - Contact us at admin@pagdiwala.com for data-related requests
         - We respond to all data requests promptly
    `
  },
  refund: {
    title: "Refund Policy",
    content: `
      1. Sales Refunds
         - No refunds or exchanges on purchased turbans unless defective upon arrival
         - Claims for defective products must be raised within 48 hours of delivery
         - Supporting images required for defect claims
         - Refund process initiated after verification

      2. Rental Refunds
         - Refunds for rental cancellations depend on cancellation timing
         - Refer to cancellation policy for specific terms
         - No refund for used or damaged turbans
         - Refund process takes 3-5 business days

      3. Refund Process
         - Refunds processed to original payment method
         - Processing time: 3-5 business days
         - Confirmation email sent after refund initiation
         - Contact support for refund status
    `
  },
  cancellation: {
    title: "Cancellation Policy",
    content: `
      1. Sales Cancellation
         - Orders cannot be cancelled after processing
         - Full refund provided if cancelled before processing
         - Processing usually begins within 24 hours
         - Contact immediately for cancellation requests

      2. Rental Cancellation
         - Full refund: Cancellations 7 days before event
         - 50% refund: Cancellations 3-6 days before event
         - No refund: Cancellations within 2 days of event
         - Contact admin@pagdiwala.com for cancellations

      3. Cancellation Process
         - Submit cancellation request via email
         - Include order number and reason
         - Wait for confirmation email
         - Refund processed as per policy
    `
  }
};

export const CONTACT_INFO = {
  email: "admin@pagdiwala.com",
  phone: "+91-7770812047",
  address: "Bilaspur, Chhattisgarh 495001, India"
};

export const ORDER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
};
