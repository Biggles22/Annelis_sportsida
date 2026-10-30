const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('#huvudmeny');
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.article-card').forEach(card => {
      card.hidden = filter !== 'alla' && card.dataset.category !== filter;
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
