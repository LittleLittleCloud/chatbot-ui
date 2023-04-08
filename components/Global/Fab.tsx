import { FC, memo, useState } from "react";

interface Props{
    label: string;
    onClick: any;
}
const FAB : FC<Props> = memo(({ label, onClick }) => {
  const [open, setOpen] = useState(false);

  // Set open state to true if user hover over "ul" element 
  const mouseEnter = () => setOpen(true);

  // Set open state to false if user hover out of "ul" element 
  const mouseLeave = () => setOpen(false);

  return (
    <div
      className="fab-container"
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      <div className="fab-button"
        onClick={onClick}>
        <span className="tooltip">
            {label}
        </span>
      </div>
    </div>
  );
});
FAB.displayName = 'fab';
export default FAB;