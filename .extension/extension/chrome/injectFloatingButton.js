import { jsx as _jsx } from "react/jsx-runtime";
import FAB from "../../components/Global/Fab";
import { IconPlus } from "@tabler/icons-react";
import { render } from "react-dom";
if (typeof window !== "undefined") {
    const root = document.createElement("chat-bot");
    const fab = _jsx(FAB, { label: "chatbot", icon: IconPlus, onClick: () => { console.log("chatbot start"); } });
    render(fab, root);
    var content = document.lastElementChild;
    content === null || content === void 0 ? void 0 : content.insertAdjacentElement("afterend", root);
}
//# sourceMappingURL=injectFloatingButton.js.map