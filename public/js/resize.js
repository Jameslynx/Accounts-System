function resize(event) {
  let thumbnail = document.querySelector("#thumbnail");
  let dialog = document.querySelector(".modal-dialog");
  let display = document.getElementById("display");
  display.classList.remove("not-visible");
  display.classList.add("offside");
  let maxWidth = display.scrollWidth;
  let targetSide = maxWidth / 2;
  display.classList.remove("offside");
  display.classList.add("not-visible");

  // image object
  const image = new Image();

  // file reader
  const reader = new FileReader();

  // html canvases
  const canvas = document.createElement("canvas");
  const target = document.createElement("canvas");

  // target div
  const back = document.createElement("div");
  back.setAttribute("class", "back");

  // reference to canvases 2d context
  const ctx = canvas.getContext("2d");
  const cht = target.getContext("2d"); // crosshair target

  // on file load
  reader.onload = (e) => {
    image.src = e.target.result;

    // on image load
    image.onload = () => {
      // draw canvases and background
      if (!drawAll(targetSide, image, maxWidth)) {
        return false;
      }
      // make display visible
      display.classList.remove("not-visible");
      display.classList.add("visible");

      // width categories, lg, md, sm, xs
      // help prevent redundant calls to drawAll
      let widthCat = [0, 0, 0, 0];
      // Listen for window resize
      window.addEventListener("resize", (e) => {
        if (window.innerWidth >= 992) {
          if (!widthCat[0]) {
            drawAll(250, image, 500);
            dialog.setAttribute("class", "modal-dialog");
            dialog.classList.add("modal-lg");
            widthCat = widthCat.map((cat, i) => (i == 0 ? 1 : 0));
          }
        } else if (window.innerWidth >= 768) {
          if (!widthCat[1]) {
            drawAll(175, image, 350);
            dialog.setAttribute("class", "modal-dialog");
            widthCat = widthCat.map((cat, i) => (i == 1 ? 1 : 0));
          }
        } else if (window.innerWidth >= 576) {
          if (!widthCat[2]) {
            drawAll(125, image, 250);
            dialog.setAttribute("class", "modal-dialog");
            widthCat = widthCat.map((cat, i) => (i == 2 ? 1 : 0));
          }
        } else if (window.innerWidth >= 300) {
          if (!widthCat[3]) {
            drawAll(75, image, 150);
            dialog.setAttribute("class", "modal-dialog");
            dialog.classList.add("modal-sm");
            widthCat = widthCat.map((cat, i) => (i == 3 ? 1 : 0));
          }
        }
      });
    };
  };

  function drawAll(targetSide, image, maxWidth) {
    // image height and width
    let { naturalWidth: imgWidth, naturalHeight: imgHeight } = image;

    // ensure image size
    if (imgWidth < targetSide || imgHeight < targetSide) return false;
    if (imgWidth > imgHeight && imgWidth > maxWidth) {
      imgHeight = (imgHeight * maxWidth) / imgWidth;
      imgWidth = maxWidth;
    } else if (imgHeight > imgWidth && imgHeight > maxWidth) {
      imgWidth = (imgWidth * maxWidth) / imgHeight;
      imgHeight = maxWidth;
    }
    if (imgWidth < targetSide || imgHeight < targetSide) return false;

    // set canvas width and height attributes to image attributes
    display.style.width = imgWidth + "px";
    display.style.height = imgHeight + "px";
    canvas.style.width = imgWidth + "px";
    canvas.style.height = imgHeight + "px";
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    canvas.id = "canvas";

    // set target width and height attributes
    target.style.width = targetSide + "px";
    target.style.height = targetSide + "px";
    target.width = targetSide;
    target.height = targetSide;
    target.id = "crosshair";

    // append canvas and target to display
    display.innerHTML = "";
    display.appendChild(canvas);
    display.appendChild(back);
    back.appendChild(target);

    // draw image to canvases
    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);
    let imageResize = new Image();

    // set image src
    imageResize.src = canvas.toDataURL();

    // on resize image load
    imageResize.onload = () => {
      cht.drawImage(
        imageResize,
        target.offsetLeft,
        target.offsetTop,
        targetSide,
        targetSide,
        0,
        0,
        targetSide,
        targetSide
      );
      thumbnail.value = target.toDataURL();
      // make element draggable
      dragElementLogic(back, target, imageResize, cht, targetSide, thumbnail);
    };
    return true;
  }
  reader.readAsDataURL(event.currentTarget.files[0]);
}

function dragElementLogic(
  container,
  dragItem,
  image,
  cht,
  targetSide,
  thumbnail
) {
  // dragging element variables
  var active = false,
    currentX,
    currentY,
    initialX,
    initialY,
    xOffset = 0,
    yOffset = 0;

  // Listeners for touch events
  container.addEventListener("touchstart", dragStart, false);
  container.addEventListener("touchend", dragEnd, false);
  container.addEventListener("touchmove", drag, false);
  container.addEventListener("touchout", dragEnd, false);

  // Listeners for mouse events
  container.addEventListener("mousedown", dragStart, false);
  container.addEventListener("mouseup", dragEnd, false);
  container.addEventListener("mousemove", drag, false);
  container.addEventListener("mouseout", dragEnd, false);

  function dragStart(e) {
    // drag start on mouse down or touch start
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    if (e.target === dragItem) {
      active = true;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    active = false;
  }

  function drag(e) {
    if (active) {
      e.preventDefault();

      // set current x and current y
      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      // check if current x and current y are out of canvas borders
      if (currentX >= dragItem.offsetLeft || currentX <= -dragItem.offsetLeft) {
        currentX = currentX > 0 ? dragItem.offsetLeft : -dragItem.offsetLeft;
      }
      if (currentY >= dragItem.offsetTop || currentY <= -dragItem.offsetTop) {
        currentY = currentY > 0 ? dragItem.offsetTop : -dragItem.offsetTop;
      }

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, dragItem);
    }
  }

  function setTranslate(xPos, yPos, el) {
    // clear image on target canvas
    cht.clearRect(0, 0, targetSide, targetSide);
    // draw new portion of image to target canvas
    cht.drawImage(
      image,
      dragItem.offsetLeft + xPos,
      dragItem.offsetTop + yPos,
      targetSide,
      targetSide,
      0,
      0,
      targetSide,
      targetSide
    );
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    thumbnail.value = dragItem.toDataURL();
  }
}
