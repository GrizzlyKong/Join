async function init() {
  displayHidden();
  logoAnimation();
 
}

function logoAnimation() {
  const logo = document.getElementById("logo-animated");
  setTimeout(() => {
    logo.style.transform = "translate(-42.25vw, -28.25vh) scale(0.35)";
  }, 500);
}


function displayHidden() {
  let logo = document.getElementById("logo-animated");
  logo.style.visibility = "visible";

  setTimeout(function () {
    document.body.style.visibility = "visible";
  }, 1500);
}
