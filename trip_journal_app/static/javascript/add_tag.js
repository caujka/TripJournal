var tags = [];
document.getElementById("demo").innerHTML = tags;

function addTag() {
    tags.push(prompt("Enter your tags"))
    document.getElementById("demo").innerHTML = tags.join(', ');
}

