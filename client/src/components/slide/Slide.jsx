import React from "react";
import "./Slide.scss";
import Slider from "infinite-react-carousel";

const Slide = ({ children, slidesToShow = 1, arrowsScroll = 1 }) => {
  return (
    <div className="slide">
      <div className="container">
        <Slider slidesToShow={slidesToShow} arrowsScroll={arrowsScroll}>
          {children}
        </Slider>
      </div>
    </div>
  );
};

export default Slide;
