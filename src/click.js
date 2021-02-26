function handleClick() {
    const element = document.createElement('div');
    element.innerHTML = 'Hello';
    element.className  ='white';
    document.body.appendChild(element)
}

export default handleClick