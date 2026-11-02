import logo from "../assets/logo.svg";
export default function Sidebar({ open, name, subtitle, view, onProfile, onLogout, onClose }) {
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Account menu">
        <div className="side-brand">
          <img src={logo} alt="" />
          <span>AgriJuan</span>
        </div>

        <div className="side-user">
          <span className="avatar">{name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{name}</strong>
            <span>{subtitle}</span>
          </div>
        </div>

        <div className="side-menu">
          <button className={`side-item ${view === "profile" ? "on" : ""}`} onClick={onProfile}>
            Profile
          </button>
        </div>

        <button className="side-item side-foot" onClick={onLogout}>Log out</button>
      </aside>
    </>
  );
}
