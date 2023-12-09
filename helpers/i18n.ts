import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

const i18n = new I18n({
  en: {
    default_error_message: "Something went wrong. Please try again later or contact support.",
    deep_link_error: "An Error occurred. Email links are only valid for 1 click. Try requesting another link or contact support.",
    help: "Help",
    onboarding: {
      action: "Let's go!",
    },
    sign_in: {
      title: "Sign in",
      message: "Click on the link sent to your email address to signin to your account (check spam folder)",
      input_title: "Email",
      input_placeholder: "Your Email",
      invalid_email: "Invalid email",
      send: "Send verification email",
      open_mail_inbox: "Open email inbox",
      resend_in: "Resend in {{countdown}}",
      legal_part1: "By continuing, you agree to our",
      legal_part2: "Privacy Policy",
      legal_part3: "and our",
      legal_part4: "Terms of Service",
    },
    push_notifications_perm: {
      title: "Get notified!",
      message: "Allow MapFacts to send you push notifications when you receive likes on your posts or when you enter a geographical zone in radar mode",
      yes: "Yes, Allow!",
      no: "Maybe later"
    }
  },
  fr: {
    default_error_message: "Quelque chose s'est mal passé. Merci de réessayer plus tard ou de contacter le support.",
    deep_link_error: "Une erreur s'est produite. Les liens par e-mail ne sont valables que pour 1 clic. Merci d'en générer un autre ou de contacter le support.",
    help: "Aide",
    onboarding: {
      action: "C'est parti !",
    },
    sign_in: {
      title: "Connexion",
      message: "Clique sur le lien envoyé à ton adresse email pour te connecter à ton compte (vérifie le dossier spam)",
      input_title: "Email",
      input_placeholder: "Ton Email",
      invalid_email: "Email invalide",
      send: "Envoyer le mail de vérification",
      open_mail_inbox: "Ouvrir la boîte mail",
      resend_in: "Renvoyer dans {{countdown}}",
      legal_part1: "En continuant, tu acceptes notre",
      legal_part2: "Politique de confidentialité",
      legal_part3: "et nos",
      legal_part4: "Conditions d'utilisation",
    },
    push_notifications_perm: {
      title: "Notifications",
      message: "Autoriser MapFacts à vous envoyer des notifications push lorsque vous recevez des likes sur vos publications ou lorsque vous entrez dans une zone géographique en mode radar",
      yes: "Oui, autoriser",
      no: "Peut-être plus tard"
    }
  },
});

i18n.locale = getLocales()[0].languageCode;

export default i18n;
