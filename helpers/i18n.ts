import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

const i18n = new I18n({
  en: {
    fact_not_found:
      "The fact was not found. Please contact support if you think this is an error.",
    default_error_message:
      "Something went wrong. Please try again later or contact support.",
    deep_link_error:
      "An Error occurred. Email links are only valid for 1 click. Try requesting another link or contact support.",
    help: "Help",
    onboarding: {
      action: "Let's go!",
    },
    sign_in: {
      title: "Sign in",
      message:
        "Click on the link sent to your email address to signin to your account (check spam folder)",
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
      message:
        "Allow MapFacts to send you push notifications when you receive likes on your posts or when you enter a geographical zone in radar mode",
      yes: "Yes, Allow!",
      no: "Maybe later",
    },
    account: {
      my_facts: "My facts",
      date: "Date",
      popularity: "Popularity",
      sort_by_date: "Sort by date",
      sort_by_popularity: "Sort by popularity",
      see_more: "See more",
      no_more_results: "No more results",
    },
    fact: {
      recenter: "Recenter",
      report: "Report",
      delete: "Delete",
      posted: "Posted",
      votes: "votes",
      downvote: "Downvote",
      upvote: "Upvote",
      delete_dialog: {
        title: "Are you sure you want to delete this fact?",
        cancel: "Cancel",
        delete: "Delete",
      },
      delete_toast_text: "Fact deleted",
      report_dialog: {
        title: "Why do you report this fact?",
        cancel: "Cancel",
        delete: "Report",
      },
      report_dialog_text: "Fact reported",
    },
    create_fact: {
      message: "Move and zoom map to place your post at the right location",
      placeholder: "A useful/intersting fact",
      cancel: "Cancel",
      post: "Post"
    },
    settings: {
      missing_notifications_perm: "Push notifications permission missing",
      notifications: "Notifications",
      privacy_policy: "Privacy Policy",
      terms_of_service: "Terms of Service",
      help: "Help",
      website: "Website",
      rate_us: "Rate us",
      share: "Share the app",
      sign_out: "Sign out",
      delete_account: "Delete my account",
      sign_out_dialog_text: "Are you sure you want to sign out?",
      delete_account_dialog_text: "Are you sure you want to delete your account?",
      cancel: "Cancel",
    },
    radar_settings: {
      info: "Get notified when you enter a fact zone !",
      activation: "Activation",
      min_upvotes: "Minimum upvotes",
      cooldown: "Cooldown"
    }
  },
  fr: {
    fact_not_found:
      "Le post est introuvable. Merci de contacter le support si tu penses que c'est une erreur.",
    default_error_message:
      "Quelque chose s'est mal passé. Merci de réessayer plus tard ou de contacter le support.",
    deep_link_error:
      "Une erreur s'est produite. Les liens par e-mail ne sont valables que pour 1 clic. Merci d'en générer un autre ou de contacter le support.",
    help: "Aide",
    onboarding: {
      action: "C'est parti !",
    },
    sign_in: {
      title: "Connexion",
      message:
        "Clique sur le lien envoyé à ton adresse email pour te connecter à ton compte (vérifie le dossier spam)",
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
      message:
        "Autoriser MapFacts à vous envoyer des notifications push lorsque vous recevez des likes sur vos publications ou lorsque vous entrez dans une zone géographique en mode radar",
      yes: "Oui, autoriser",
      no: "Peut-être plus tard",
    },
    account: {
      my_facts: "Mes posts",
      date: "Date",
      popularity: "Popularité",
      sort_by_date: "Trier par date",
      sort_by_popularity: "Trier par popularité",
      see_more: "Voir plus",
      no_more_results: "Il n'y a pas plus de posts",
    },
    fact: {
      recenter: "Recentrer",
      report: "Signaler",
      delete: "Supprimer",
      posted: "Posté",
      votes: "votes",
      downvote: "Vote négatif",
      upvote: "Vote positif",
      delete_dialog: {
        title: "Es-tu sûr de vouloir supprimer ce post ?",
        cancel: "Annuler",
        delete: "Supprimer",
      },
      delete_toast_text: "Post supprimé",
      report_dialog: {
        title: "Quel est la raison du signalement de ce post ?",
        cancel: "Annuler",
        delete: "Signaler",
      },
      report_dialog_text: "Post signalé",
    },
    create_fact: {
      message: "Déplace et zoome la carte pour placer votre message au bon endroit",
      placeholder: "Un fait utile/intéressant",
      cancel: "Annuler",
      post: "Poster"
    },
    settings: {
      missing_notifications_perm: "Permission de notifications manquante",
      notifications: "Notifications",
      privacy_policy: "Politique de confidentialité",
      terms_of_service: "Conditions d'utilisation",
      help: "Aide",
      website: "Site web",
      rate_us: "Note mapfacts",
      share: "Partage l'application",
      sign_out: "Se déconnecter",
      delete_account: "Supprimer mon compte",
      sign_out_dialog_text: "Es-tu sûr de vouloir te déconnecter ?",
      delete_account_dialog_text: "Es-tu sûr de vouloir supprimer ton compte ?",
      cancel: "annuler",
    },
    radar_settings: {
      info: "Soyez notifié lorsque vous entrez dans la zone d'un post!",
      activation: "Activation",
      min_upvotes: "Votes positifs minimum",
      cooldown: "Délai"
    }
  },
});

i18n.locale = getLocales()[0].languageCode;

export default i18n;
