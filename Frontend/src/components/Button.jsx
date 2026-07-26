import "./button.css";

function Button({children, icon, onClick, type = "button",}) {
    return (
        <button className="btn"
        onClick={onClick}
        type="{type}">
            {icon}
            <span>{children}</span>
        </button>
    )
}

export default Button;