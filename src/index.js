import './css/base.css';
import './scss/main.scss';
import { a } from './vendor/util'; // 当使用 es6 写模块时，webpack 在打包时会自动执行 js tree shaking?
import { chunk } from 'lodash-es'; // js tree shaking 利用的是 ES 的模块系统。而 lodash.js 使用的是 CommonJS 而不是 ES6 的写法。所以，安装对应的模块系统即可。

console.log(a());

console.log(chunk([1, 2, 3], 2));

// 使用 prefetch 来实现在带宽空闲时，再加载click.js
document.addEventListener('click', function () {
  import(/*webpackPrefetch: true*/ './click').then(({ default: func }) => {
    func();
  });
});

// CSS Tree Shaking：在页面上添加一个 .box 元素
var app = document.querySelector('#app');
var div  = document.createElement('div');
div.className = 'box';
app.appendChild(div)
