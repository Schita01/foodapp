import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing } from "@/theme";
import { Screen, ScreenHeader, Text } from "@/components/ui";

type Block =
  | { type: "title"; text: string }
  | { type: "meta"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string };

type Doc = { headerTitle: string; blocks: Block[] };

const TERMS: Doc = {
  headerTitle: "Terms and conditions",
  blocks: [
    { type: "title", text: "USER TERMS" },
    { type: "meta", text: "Effective from 31 July 2024" },
    {
      type: "paragraph",
      text: "Thank you for using RescueBite and for joining the fight against food waste!",
    },
    { type: "heading", text: "1. Join the RescueBite movement" },
    {
      type: "paragraph",
      text: "1.1 We dream of a planet with no food waste. RescueBite's mission is to raise awareness of food waste and to reduce it on a global scale. Our mobile application helps businesses and consumers fight food waste together by rescuing meals that would otherwise have ended up in the bin (the \"RescueBite app\" or simply the \"App\"). By using the App you contribute to the goal of ensuring that all the food that is produced is also eaten.",
    },
    {
      type: "paragraph",
      text: "1.2 To reach this goal we strive to keep things simple, and we offer an easy concept that gives consumers like you, who use our App, the collective ability to rescue meals from retail and food-service businesses such as supermarkets, bakeries, canteens, restaurants, producers and other surplus-food providers (each a \"Store\"). Our App helps you find Stores and reserve surplus food. Stores offer surplus food by listing a number of bags in the App, which they fill with their surplus food and make available so you can reserve them (we call each of these bags a \"Surprise Bag\").",
    },
    {
      type: "paragraph",
      text: "1.3 When you use our App, please remember that RescueBite does not own, control, offer or manage the contents of any Surprise Bags made available by Stores for reservation. RescueBite is also not a party to the sale of the food that the Stores provide to you in the Surprise Bags.",
    },
    { type: "heading", text: "2. What is covered by these Terms?" },
    {
      type: "paragraph",
      text: "These Terms govern your access to and use of the App, including reserving and collecting Surprise Bags. By creating an account or using the App you accept these Terms and our Privacy Policy. If you do not agree, please do not use the App.",
    },
    { type: "heading", text: "3. Reservations and collection" },
    {
      type: "paragraph",
      text: "When you reserve a Surprise Bag, you agree to collect it from the Store during the stated collection window and to bring the order confirmation shown in the App. Contents are a surprise and may vary. Stores are responsible for the quality, safety and accurate description of the food, including allergen information.",
    },
    { type: "heading", text: "4. Payments and refunds" },
    {
      type: "paragraph",
      text: "Payment is taken at the time of reservation through the payment methods available in the App. If a Store cannot fulfil your reservation, you may be entitled to a refund in accordance with our refund policy. Refund requests can be raised through Support in the App.",
    },
    { type: "heading", text: "5. Your responsibilities" },
    {
      type: "paragraph",
      text: "You agree to use the App lawfully and respectfully, to provide accurate information, and to keep your account secure. You are responsible for checking allergen and ingredient information before consuming any food collected through the App.",
    },
  ],
};

const PRIVACY: Doc = {
  headerTitle: "Privacy Policy",
  blocks: [
    { type: "title", text: "PRIVACY POLICY" },
    { type: "meta", text: "Effective from 31 July 2024" },
    {
      type: "paragraph",
      text: "This Privacy Policy explains how RescueBite collects, uses and protects your personal data when you use the App.",
    },
    { type: "heading", text: "1. Data we collect" },
    {
      type: "paragraph",
      text: "We collect information you provide when creating an account (such as your name and email), your location when you choose to share it, and information about your reservations and orders so we can provide the service.",
    },
    { type: "heading", text: "2. How we use your data" },
    {
      type: "paragraph",
      text: "We use your data to operate the App, process reservations and payments, show nearby Surprise Bags, provide support, and — where you have opted in — to send you reminders and offers. You can manage these preferences any time in Profile - Notifications and Profile - Legal.",
    },
    { type: "heading", text: "3. Cookies and similar technologies" },
    {
      type: "paragraph",
      text: "We use required cookies to run the App and, with your consent, optional cookies for analytics, personalization and marketing. You can update your choices at any time under Cookie preferences.",
    },
    { type: "heading", text: "4. Your rights" },
    {
      type: "paragraph",
      text: "You have the right to access, correct or delete your personal data, and to request a copy of it. You can request a data export or delete your account from Profile - Legal.",
    },
  ],
};

export default function LegalDocScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = doc === "privacy" ? PRIVACY : TERMS;

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={content.headerTitle} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {content.blocks.map((block, i) => {
          switch (block.type) {
            case "title":
              return (
                <Text key={i} variant="h1" tone="brand" style={styles.docTitle}>
                  {block.text}
                </Text>
              );
            case "meta":
              return (
                <Text key={i} variant="bodySm" tone="secondary" style={styles.meta}>
                  {block.text}
                </Text>
              );
            case "heading":
              return (
                <Text key={i} variant="h3" tone="brand" style={styles.heading}>
                  {block.text}
                </Text>
              );
            default:
              return (
                <Text key={i} variant="body" tone="secondary" style={styles.paragraph}>
                  {block.text}
                </Text>
              );
          }
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
  docTitle: { marginTop: spacing.md, marginBottom: spacing.xs },
  meta: { marginBottom: spacing.lg },
  heading: { marginTop: spacing.xl, marginBottom: spacing.sm, color: colors.primaryDark },
  paragraph: { marginBottom: spacing.md, lineHeight: 23 },
});
