import React from "react";
import { IconPlus } from "@tabler/icons-react";
import { render } from "react-dom";
import { Fab } from "@mui/material";
if (typeof window !== "undefined") {
    const root = document.createElement("chat-bot");
    const fabStyle = {
        position: 'fixed',
        bottom: 16,
        right: 16,
      };
    const fab = <Fab sx={fabStyle} >
        <IconPlus />
    </Fab>
    render(fab, root);
    document.body.appendChild(root)
}

