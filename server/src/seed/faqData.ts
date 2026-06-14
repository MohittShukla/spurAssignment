import { FAQEntry } from "../types";

/**
 * Domain knowledge for the fictional e-commerce store "Spark & Co."
 *
 * This data is injected into the LLM system prompt so the agent can
 * answer common customer questions without hallucinating.
 */
export const FAQ_DATA: FAQEntry[] = [
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day hassle-free return policy. Items must be unused, in original packaging, and accompanied by a receipt. Refunds are processed within 5–7 business days after we receive the returned item.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes! We ship to over 50 countries including the USA, UK, Canada, Australia, and across the EU. International shipping typically takes 7–14 business days. Standard domestic shipping (India) takes 3–5 business days.",
  },
  {
    question: "What are your shipping costs?",
    answer:
      "Domestic orders over ₹999 qualify for free shipping. Orders below ₹999 incur a flat ₹79 shipping fee. International shipping starts at $9.99 and varies by destination.",
  },
  {
    question: "What are your support hours?",
    answer:
      "Our support team is available Monday to Saturday, 9 AM – 9 PM IST. You can also email us anytime at support@sparkandco.com and we'll respond within 24 hours.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, UPI, net banking, Razorpay, and PayPal for international orders. All transactions are secured with 256-bit SSL encryption.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Absolutely. Once your order ships, you'll receive an email and SMS with a tracking link. You can also check order status anytime in 'My Orders' on our website.",
  },
  {
    question: "Do you offer exchanges?",
    answer:
      "Yes, we offer free exchanges within 30 days for size or colour swaps on eligible items. Just contact support and we'll arrange a pickup.",
  },
  {
    question: "What is Spark & Co.?",
    answer:
      "Spark & Co. is an online lifestyle and accessories store offering curated, high-quality products ranging from tech gadgets to everyday essentials. We focus on quality, great design, and delightful customer experiences.",
  },
];

/** Pre-formatted block ready to be inserted into a system prompt */
export function buildFAQPromptBlock(): string {
  const lines = FAQ_DATA.map(
    (faq) => `Q: ${faq.question}\nA: ${faq.answer}`
  );
  return lines.join("\n\n");
}
