window.addEventListener("load", () => {
  let launcher = document.querySelector("#modal-launcher");
  if (launcher) {
    let input = document.createElement("input");
    input.type = "file";
    input.value = "";
    input.name = "fileup";
    input.id = "fileup";
    let container = document.querySelector(".btn-container");
    launcher.addEventListener("click", () => {
      container.appendChild(input);
    });
  }
});
