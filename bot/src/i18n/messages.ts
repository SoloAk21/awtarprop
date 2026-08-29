import { PREMIUM_BODY_EMOJIS, AwtarPropBrandName } from "../config/emojis";

export type SupportedLang = "EN" | "AM";

export const MESSAGES = {
  EN: {
    welcomeNew: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.GLOBE} <b>Welcome to ${AwtarPropBrandName}, ${name}!</b>\n\nPlease select your preferred language to continue:`,
    welcomeVerified: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.WAVE} <b>Welcome back ${name} to ${AwtarPropBrandName}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\nYour account is fully verified. Tap below to launch the marketplace app.`,
    channelRequired: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.PIN} <b>Official Channel Join Required</b>\n\nWelcome ${name}! To access ${AwtarPropBrandName}, please join our official Telegram channel first.`,
    requestPhone: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.WAVE} <b>Welcome ${name}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\n${PREMIUM_BODY_EMOJIS.PHONE} Please share your contact phone number below to complete account verification.`,
    phoneVerified: `${PREMIUM_BODY_EMOJIS.SHIELD} <b>Contact Verification Complete!</b> ${PREMIUM_BODY_EMOJIS.STAR}\n\nYour phone number is securely registered.`,
    launchAppPrompt: `${PREMIUM_BODY_EMOJIS.SPARKLES} Tap below to open the ${AwtarPropBrandName} Marketplace App:`,
    invalidPhoneOwner: `${PREMIUM_BODY_EMOJIS.WARNING} <b>Invalid Contact</b>\n\nPlease share <b>your own contact number</b> using the button below.`,
    channelVerifiedSuccess: `Channel subscription verified!`,
    channelNotJoined: `You haven't joined the official channel yet. Please join and try again.`,
    langSaved: `Language saved successfully!`,
    langSelectPrompt: `${PREMIUM_BODY_EMOJIS.GLOBE} <b>Language Settings / ቋንቋ ይምረጡ</b>\n\nChoose your preferred language:`,
    helpText:
      `${PREMIUM_BODY_EMOJIS.INFO} <b>${AwtarPropBrandName} Help & Guide</b>\n\n` +
      `• <b>/start</b> - Start or restart the bot and open Mini App\n` +
      `• <b>/language</b> - Switch language preference\n` +
      `• <b>/help</b> - View this command guide\n\n` +
      `Tap <b>Open Marketplace</b> to explore verified property listings directly inside Telegram.`,
    btnOpenApp: "Open Marketplace App",
    btnJoinChannel: "Join Official Channel",
    btnIHaveJoined: "I Have Joined",
    btnShareContact: "Share Contact Phone Number",
    btnLangEn: "English",
    btnLangAm: "አማርኛ",
    btnChangeLang: "Change Language / ቋንቋ ለመቀየር",
    errorGeneric: `${PREMIUM_BODY_EMOJIS.WARNING} An error occurred. Please try again later.`,
    processing: "Processing...",
  },
  AM: {
    welcomeNew: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.GLOBE} <b>እንኳን ወደ ${AwtarPropBrandName} በደህና መጡ ${name}!</b>\n\nእባክዎን መቀጠል የሚፈልጉበትን ቋንቋ ይምረጡ:`,
    welcomeVerified: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.WAVE} <b>እንኳን ወደ ${AwtarPropBrandName} በደህና መጡ ${name}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\nመለያዎ የተረጋገጠ ነው። ገበያውን ለመክፈት ከታች ያለውን ይጫኑ።`,
    channelRequired: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.PIN} <b>የቻናል አባልነት ያስፈልጋል</b>\n\nእንኳን ደህና መጡ ${name}! ገበያውን ለመጠቀም እባክዎን አስቀድመው ይፋዊ ቴሌግራም ቻናላችንን ይቀላቀሉ።`,
    requestPhone: (name: string) =>
      `${PREMIUM_BODY_EMOJIS.WAVE} <b>እንኳን ደህና መጡ ${name}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\n${PREMIUM_BODY_EMOJIS.PHONE} እባክዎን ማረጋገጫውን ለማጠናቀቅ የስልክ ቁጥርዎን ያጋሩ።`,
    phoneVerified: `${PREMIUM_BODY_EMOJIS.SHIELD} <b>የስልክ ቁጥር ማረጋገጫ ተጠናቋል!</b> ${PREMIUM_BODY_EMOJIS.STAR}\n\nየስልክ ቁጥርዎ በደህና ተመዝግቧል።`,
    launchAppPrompt: `${PREMIUM_BODY_EMOJIS.SPARKLES} ገበያውን ለመክፈት ከታች ያለውን ይጫኑ:`,
    invalidPhoneOwner: `${PREMIUM_BODY_EMOJIS.WARNING} <b>የተሳሳተ ስልክ ቁጥር</b>\n\nእባክዎን <b>የራስዎን ስልክ ቁጥር</b> ከታች ያለውን ቁልፍ በመጫን ያጋሩ።`,
    channelVerifiedSuccess: `ቻናል ተቀላቅለዋል!`,
    channelNotJoined: `እስካሁን ቻናሉን አልተቀላቀሉም። እባክዎን ተቀላቅለው እንደገና ይሞክሩ።`,
    langSaved: `ቋንቋ ተመርጧል!`,
    langSelectPrompt: `${PREMIUM_BODY_EMOJIS.GLOBE} <b>የቋንቋ ምርጫ / Language Settings</b>\n\nእባክዎን ቋንቋ ይምረጡ:`,
    helpText:
      `${PREMIUM_BODY_EMOJIS.INFO} <b>${AwtarPropBrandName} የእርዳታ መመሪያ</b>\n\n` +
      `• <b>/start</b> - ቦቱን ለመጀመር እና አፕሊኬሽኑን ለመክፈት\n` +
      `• <b>/language</b> - ቋንቋ ለመቀየር\n` +
      `• <b>/help</b> - ይህንን የእርዳታ መመሪያ ለማየት\n\n` +
      `የሪል እስቴት ገበያውን ለመክፈት ከታች ያለውን ቁልፍ ይጫኑ።`,
    btnOpenApp: "አውታርፕሮፕ ገበያን ክፈት",
    btnJoinChannel: "ቻናል ይቀላቀሉ",
    btnIHaveJoined: "ተቀላቅያለሁ",
    btnShareContact: "ስልክ ቁጥሬን አጋራ",
    btnLangEn: "English",
    btnLangAm: "አማርኛ",
    btnChangeLang: "Change Language / ቋንቋ ለመቀየር",
    errorGeneric: `${PREMIUM_BODY_EMOJIS.WARNING} ችግር አጋጥሟል። እባክዎን ትንሽ ቆይተው እንደገና ይሞክሩ።`,
    processing: "በማስኬድ ላይ...",
  },
};
