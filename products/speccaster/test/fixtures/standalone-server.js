const server = require('./server');
const port = Number(process.env.PORT || 0);
server.listen(port, () => {
  console.log('fixture server on', server.address().port);
});