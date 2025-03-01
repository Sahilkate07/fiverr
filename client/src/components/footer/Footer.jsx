import React from "react";
import "./Footer.scss";

function Footer() {
  return (
    <div className="footer">
      <div className="container">
        
        
          
        
        
        <hr />
        <div className="bottom">
          <div className="left">
            <h2>fiverr</h2>
            <span>© Fiverr . 2025</span>
          </div>
          <div className="right">
            <div className="social">
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                <img src="/img/twitter.png" alt="Twitter" />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                <img src="/img/facebook.png" alt="Facebook" />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
                <img src="/img/linkedin.png" alt="LinkedIn" />
              </a>
              <a href="https://pinterest.com/" target="_blank" rel="noopener noreferrer">
                <img src="/img/pinterest.png" alt="Pinterest" />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                <img src="/img/instagram.png" alt="Instagram" />
              </a>
            </div>
            <div className="link">
              <img src="/img/language.png" alt="" />
              <span>English</span>
            </div>
            <div className="link">
              <img src="/img/coin.png" alt="" />
              <span>USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
