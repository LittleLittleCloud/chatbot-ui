import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState } from "react";
const FAB = memo(({ label, onClick, icon }) => {
    const [open, setOpen] = useState(false);
    // Set open state to true if user hover over "ul" element 
    const mouseEnter = () => setOpen(true);
    // Set open state to false if user hover out of "ul" element 
    const mouseLeave = () => setOpen(false);
    return (_jsx("div", Object.assign({ className: "fab-container", onMouseEnter: mouseEnter, onMouseLeave: mouseLeave }, { children: _jsxs("div", Object.assign({ className: "fab-button", onClick: onClick }, { children: [icon, _jsx("span", Object.assign({ className: "tooltip" }, { children: label }))] })) })));
});
FAB.displayName = 'fab';
export default FAB;
//# sourceMappingURL=Fab.js.map