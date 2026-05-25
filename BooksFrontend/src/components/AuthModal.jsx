import AuthForm from "./AuthForm";

function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <AuthForm onSuccess={onClose} onCancel={onClose} />
      </div>
    </div>
  );
}

export default AuthModal;
