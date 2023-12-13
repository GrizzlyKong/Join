function includeHeader() {
    fetch('../html/header.html')
        .then(response => response.text())
        .then(html => {
            document.body.innerHTML += html;
        })
        .catch(error => console.error('Error fetching header.html:', error));
}