export let checkTheme = () => {
    const themeChecker = window.matchMedia('(prefers-color-scheme: light)');
    let isLight = false;

    if(localStorage.getItem("gcTheme") !== undefined){
        isLight = localStorage.getItem("gcTheme") === "light" ? true : false
    }

    if(themeChecker.matches || isLight){
      document.body.classList.replace("dark", "light");
      isLight = true;
    }

    themeChecker.addEventListener("change", () => {
      if(themeChecker.matches){
        document.body.classList.replace("dark", "light");
        isLight = true;
      } else{
        document.body.classList.replace("light", "dark");
        isLight = false
      }
    })

    
    return isLight;
}

