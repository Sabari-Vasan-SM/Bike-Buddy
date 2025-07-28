"use client"

import { useEffect, useState } from "react"

function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => onLoadingComplete?.(), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [onLoadingComplete])

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Animated Bike */}
        <div className="bike-container">
          <div className="bike-body">
            <svg
              width="120"
              height="80"
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="bike-svg"
            >
              {/* Front Wheel */}
              <circle
                cx="20"
                cy="60"
                r="18"
                stroke="#00d2aa"
                strokeWidth="3"
                fill="none"
                className="wheel front-wheel"
              />
              <circle cx="20" cy="60" r="3" fill="#00d2aa" />

              {/* Back Wheel */}
              <circle
                cx="100"
                cy="60"
                r="18"
                stroke="#0ea5e9"
                strokeWidth="3"
                fill="none"
                className="wheel back-wheel"
              />
              <circle cx="100" cy="60" r="3" fill="#0ea5e9" />

              {/* Frame */}
              <path
                d="M20 60 L60 20 L100 60 M60 20 L60 40 M40 40 L80 40"
                stroke="#fb7185"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Handlebars */}
              <path d="M15 45 L25 45" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

              {/* Seat */}
              <path d="M75 35 L85 35" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Road */}
          <div className="road">
            <div className="road-line"></div>
            <div className="road-line" style={{ animationDelay: "0.5s" }}></div>
            <div className="road-line" style={{ animationDelay: "1s" }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="loading-text">
          <h2>Getting your ride ready...</h2>
          <p>🔧 Checking the engine • 🛠️ Tuning the gears • ✨ Almost there!</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      </div>

      <style jsx>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }

        .loading-content {
          text-align: center;
          max-width: 500px;
          padding: 2rem;
        }

        .bike-container {
          position: relative;
          margin-bottom: 3rem;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bike-body {
          animation: bikeRide 4s ease-in-out infinite;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        .wheel {
          animation: wheelSpin 0.5s linear infinite;
          transform-origin: center;
        }

        .front-wheel {
          animation-duration: 0.4s;
        }

        .back-wheel {
          animation-duration: 0.3s;
        }

        .road {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          height: 2px;
          background: #cbd5e1;
          overflow: hidden;
        }

        .road-line {
          position: absolute;
          top: 0;
          width: 40px;
          height: 2px;
          background: #00d2aa;
          animation: roadMove 2s linear infinite;
        }

        @keyframes roadMove {
          0% {
            left: -50px;
          }
          100% {
            left: 100%;
          }
        }

        .loading-text {
          margin-bottom: 2rem;
        }

        .loading-text h2 {
          font-family: 'Poppins', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #00d2aa 0%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .loading-text p {
          color: #64748b;
          font-size: 1rem;
          font-weight: 500;
          animation: float 2s ease-in-out infinite;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00d2aa 0%, #0ea5e9 50%, #fb7185 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        .progress-text {
          font-weight: 700;
          color: #334155;
          font-size: 0.9rem;
          min-width: 40px;
        }

        @keyframes bikeRide {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(10px) translateY(-2px);
          }
          50% {
            transform: translateX(0) translateY(0);
          }
          75% {
            transform: translateX(-10px) translateY(-1px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @media (max-width: 640px) {
          .loading-content {
            padding: 1rem;
          }
          
          .loading-text h2 {
            font-size: 1.5rem;
          }
          
          .bike-svg {
            width: 100px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
