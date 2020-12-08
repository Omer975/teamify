import React, { useState } from "react";
import BeanIcon from "../../assets/bean-black.png";

export default function BeanCard() {
    const [click, setClick] = useState(false);

    const handleClick = () => setClick(!click);
    return (
        <div className="bean-card">
            <div onClick={handleClick} className="flex-start">
                <img src={BeanIcon} />
            </div>

            {
                click ?
                    <div className="bean-popup">

                        <div className="popup-content">
                            <span onClick={handleClick} className=" close-button flex-end">&times;</span>
                            <div className="flex-column content">
                                <div className="flex-center">
                                    <img src={BeanIcon} />
                                    <span>+1</span>
                                </div>
                                <p>Well Bean!</p>
                            </div>

                        </div>

                    </div> : null
            }


        </div>
    );
}