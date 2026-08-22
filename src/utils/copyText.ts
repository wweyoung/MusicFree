import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "@/utils/toast";
import i18n from "@/core/i18n";

export default function (text: string) {
    try {
        Clipboard.setString(text.toString());
        Toast.success(i18n.t("toast.copiedToClipboard"));
    } catch {
        Toast.warn(i18n.t("toast.copiedToClipboardFailed"));
    }
}
