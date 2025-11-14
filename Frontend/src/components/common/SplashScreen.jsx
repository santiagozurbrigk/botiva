export default function SplashScreen({ visible }) {
  return (
    <div className={`splash-overlay ${visible ? 'splash-overlay--visible' : ''}`}>
      {visible && (
        <>
          <div className="splash-overlay__background" />
          <img src="/logo.png" alt="Botiva" className="splash-overlay__logo" />
        </>
      )}
    </div>
  );
}

