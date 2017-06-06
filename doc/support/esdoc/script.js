function keyupListener(event) {
  var keyCode = event.keyCode;
  if (keyCode === 70) {
    var searchBox = document.getElementsByClassName('search-box')[0];
    searchBox.className = 'search-box active';
    
    document.getElementsByClassName('search-input')[0].focus();
    
  } else if (keyCode === 27) {
    var searchBox = document.getElementsByClassName('search-box')[0];
    searchBox.className = 'search-box';
    
    document.getElementsByClassName('search-input')[0].blur();
  }
}

document.addEventListener("keyup", keyupListener, false);
