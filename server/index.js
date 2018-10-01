import server from 'mbtiles-server';

server({
  cache: `${process.cwd()}/data`,
  port: 5000,
  verbose: true,
});