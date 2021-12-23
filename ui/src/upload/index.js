export default (uploaderName = '', uploaderOptions = {}) => {
  return new Promise((resolve, reject) => {
    let formData;

    if (uploaderOptions?.files?.length > 0) {
      formData = new FormData();

      Array.from(uploaderOptions?.files).forEach((file) => {
        formData.append('files', file);
      });
    }
  
    const request = new XMLHttpRequest();
    
    request.onload = () => {
      console.log(request.responseText);
    };
    
    request.open('POST', `${window.location.origin}/api/_uploaders/${uploaderName}`);
    request.setRequestHeader('Content-Type', 'multipart/form-data');

    request.send(formData);
  });
};