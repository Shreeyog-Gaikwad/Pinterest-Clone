document.querySelector("#imgUpload").addEventListener('click', function(){
    document.querySelector('#uploadImg input').click();
  });

  document.querySelector("#uploadImg input").addEventListener('change', function(){
    document.querySelector('#uploadImg').submit();
  });