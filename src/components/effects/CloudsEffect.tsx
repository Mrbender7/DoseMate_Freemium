export function CloudsEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <style>{`
        .cloud {
          position: absolute;
          background: rgba(100, 100, 100, 0.15);
          border-radius: 100px;
          filter: blur(8px);
        }
        
        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: rgba(100, 100, 100, 0.15);
          border-radius: 100px;
        }
        
        .cloud-1 {
          width: 200px;
          height: 60px;
          top: 10%;
          animation: drift-1 40s linear infinite;
        }
        
        .cloud-1::before {
          width: 80px;
          height: 80px;
          top: -40px;
          left: 20px;
        }
        
        .cloud-1::after {
          width: 100px;
          height: 70px;
          top: -30px;
          right: 30px;
        }
        
        .cloud-2 {
          width: 180px;
          height: 50px;
          top: 30%;
          animation: drift-2 35s linear infinite;
        }
        
        .cloud-2::before {
          width: 70px;
          height: 70px;
          top: -35px;
          left: 25px;
        }
        
        .cloud-2::after {
          width: 90px;
          height: 60px;
          top: -25px;
          right: 25px;
        }
        
        .cloud-3 {
          width: 220px;
          height: 70px;
          top: 50%;
          animation: drift-3 45s linear infinite;
        }
        
        .cloud-3::before {
          width: 90px;
          height: 90px;
          top: -45px;
          left: 30px;
        }
        
        .cloud-3::after {
          width: 110px;
          height: 80px;
          top: -35px;
          right: 35px;
        }
        
        .cloud-4 {
          width: 190px;
          height: 55px;
          top: 70%;
          animation: drift-4 38s linear infinite;
        }
        
        .cloud-4::before {
          width: 75px;
          height: 75px;
          top: -37px;
          left: 28px;
        }
        
        .cloud-4::after {
          width: 95px;
          height: 65px;
          top: -28px;
          right: 28px;
        }
        
        @keyframes drift-1 {
          from { left: -250px; }
          to { left: 100%; }
        }
        
        @keyframes drift-2 {
          from { left: -250px; }
          to { left: 100%; }
        }
        
        @keyframes drift-3 {
          from { left: -250px; }
          to { left: 100%; }
        }
        
        @keyframes drift-4 {
          from { left: -250px; }
          to { left: 100%; }
        }
      `}</style>
    </div>
  );
}
