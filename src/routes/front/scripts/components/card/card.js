import { fetchRecordImage } from "../../api/Util.js";

export default function Card({ name }) {
    const card = document.createElement('div');
    const shadow = card.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
        <style>
            .card {
                border: 2.5px solid #e255a3;
                border-radius: 8px;
                padding: 1em;
                background-color: #fd85c7;
                box-shadow: 2px 4px 0px 0px #e255a3, 0px 0px 0px 2px #fff inset;
                font-family: sans-serif;
                width: 100%;
                min-width: 380px;
                max-width: 380px;
                aspect-ratio: 1 / 1;
                box-sizing: border-box;
                margin: 0 auto;
                animation: sketchyWobble 1.2s infinite alternate cubic-bezier(.7,-0.5,.3,1.5);
                transition: box-shadow 0.3s cubic-bezier(.7,-0.5,.3,1.5), transform 0.25s cubic-bezier(.7,-0.5,.3,1.5), animation 0.2s;
            }
            
            .card:hover {
                animation: sketchyWobbleHover 1.2s infinite alternate cubic-bezier(.7,-0.5,.3,1.5);
                box-shadow: 
                    10px 20px 0px 0px #e255a3,              /* hard shadow */
                    0px 0px 20px 6px rgba(226, 85, 163, 0.5), /* glow */
                    0px 0px 0px 2px #fff inset;
                transform: translateY(-6px) scale(1.02);
            }
            .card-title-box {
                background-color: #f7e2ed;
                border-radius: 8px;
                padding:0.2rem;
                box-shadow: 2px 8px 0px 0px #e672b1, 0px 0px 0px 4px #fff inset;
                vertical-align:center;
                margin-bottom:2em;
            }
            .card-title {
                font-weight: bold;
                font-size: 2em;
                font-family: "Hina Mincho light", serif;
                text-align: center;
                word-break: break-word;
                
                white-space: normal;
            }
            @keyframes sketchyWobble {
                0% { transform: rotate(-1deg) scale(1.01, 0.99) skew(-1deg, 1deg); }
                20% { transform: rotate(3deg) scale(0.99, 1.01) skew(3deg, -1deg); }
                40% { transform: rotate(-2deg) scale(1.02, 0.98) skew(-2deg, 2deg); }
                60% { transform: rotate(3deg) scale(0.98, 1.02) skew(5deg, -2deg); }
                80% { transform: rotate(-3deg) scale(1.01, 0.99) skew(-1deg, 1deg); }
                100% { transform: rotate(1deg) scale(1, 1) skew(2deg, 0deg); }
            }
            @keyframes sketchyWobbleHover {
                0% { transform: translateY(0) rotate(-2deg) scale(1.03, 0.97) skew(-2deg, 2deg); }
                20% { transform: translateY(-20px) rotate(4deg) scale(0.97, 1.03) skew(4deg, -2deg); }
                50% { transform: translateY(-32px) rotate(-3deg) scale(1.04, 0.96) skew(-3deg, 3deg); }
                80% { transform: translateY(-20px) rotate(4deg) scale(0.96, 1.04) skew(6deg, -3deg); }
                100% { transform: translateY(0) rotate(2deg) scale(1, 1) skew(3deg, 0deg); }
            }
            a {
                text-decoration: none;
                color: inherit;
            }
           
            .card-desc {
                color: #555;
            }
        </style>
        <a href=${name}> 
            <div class="card">
                <div class="card-title-box"> 
                    <div class="card-title">${name}</div>
                </div>
                <div class="card-image-box">
                
                </div>
            </div>
        </a>
    `;
    const imageBox = shadow.querySelector('.card-image-box');
    setTimeout(async () => {
        try {
            const imagePath = await fetchRecordImage("youtube.com");
            if (imagePath) {
                const img = document.createElement('img');
                img.src = imagePath;
                img.alt = `${name} screenshot`;
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.boxShadow = ' 2px 8px 0px 0px #e672b1, 0px 0px 0px 4px #fff inset'
                img.style.borderRadius = '6px';
                imageBox.innerHTML = ""; // clear first
                imageBox.appendChild(img);
            } else {
                imageBox.textContent = 'Image not available';
            }
        } catch (err) {
            console.error(err);
            imageBox.textContent = 'Image not available';
        }
    }, 0);



    return card;
}