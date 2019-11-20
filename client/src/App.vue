<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App'
}

</script>
<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  position: relative;
  height: 100%;
  font-family: "Microsoft Yahei", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@font-face {
  font-family: 'iconfont';
  /* project id 1103075 */
  src: url('//at.alicdn.com/t/font_1103075_poqj7smdsug.eot');
  src: url('//at.alicdn.com/t/font_1103075_poqj7smdsug.eot?#iefix') format('embedded-opentype'),
    url('//at.alicdn.com/t/font_1103075_poqj7smdsug.woff2') format('woff2'),
    url('//at.alicdn.com/t/font_1103075_poqj7smdsug.woff') format('woff'),
    url('//at.alicdn.com/t/font_1103075_poqj7smdsug.ttf') format('truetype'),
    url('//at.alicdn.com/t/font_1103075_poqj7smdsug.svg#iconfont') format('svg');
}
div,
p,
ul,
li {
  box-sizing: border-box;
}
input:-webkit-autofill,
textarea:-webkit-autofill,
select:-webkit-autofill {
  /*-webkit-text-fill-color: #ededed !important;*/
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  background-color: transparent;
  background-image: none;
  transition: background-color 50000s ease-in-out 0s;
}

</style>
