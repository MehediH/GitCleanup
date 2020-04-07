export let checkTheme = () => {
  let isLight = false;
  
  if(localStorage.getItem("gcTheme") !== undefined){
    isLight = localStorage.getItem("gcTheme") === "light" ? true : false
  }

  if(window.matchMedia){
    const themeChecker = window.matchMedia('(prefers-color-scheme: light)');

    if(themeChecker.matches || isLight){
      document.body.classList.replace("dark", "light");
      isLight = true;
    }

    themeChecker.addListener( () => {
      if(themeChecker.matches){
        document.body.classList.replace("dark", "light");
        isLight = true;
      } else{
        document.body.classList.replace("light", "dark");
        isLight = false
      }
    })
  } else{
    if(isLight){
      document.body.classList.replace("dark", "light");
      isLight = true;
    }
  }
 
  
  return isLight;
}

