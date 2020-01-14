import axios from 'axios';
import http from 'http';
import querystring from 'querystring';
import url from 'url';

http
  .createServer((req, res) => {
    const name = querystring.parse(url.parse(req.url || '').query || '')?.name;

    if (name) {
      const serviceSet = {
        vk: 'https://vk.com/',
        ig: 'https://instagram.com/',
        fb: 'https://fb.com/',
        tw: 'https://twitter.com/',
        yt: 'https://youtube.com/c/'
      };

      (async () => {
        const order: (keyof typeof serviceSet)[] = [];

        const responseList = await Promise.all(
          Object.entries(serviceSet).map(entry => {
            const serviceName = entry[0] as keyof typeof serviceSet;
            const serviceURL = entry[1];

            order.push(serviceName);

            return axios.get(serviceURL + name).catch(error => error);
          })
        );

        const result = responseList.reduce(
          (accumulator, item, index) => {
            const serviceName = order[index] as keyof typeof serviceSet;
            const status = item.status || item.response.status;

            accumulator[status === 404 ? 'free' : 'busy'][serviceName] = {
              url: serviceSet[serviceName] + name,
              status
            };

            return accumulator;
          },
          { free: {}, busy: {} }
        );

        res.write(`<pre>${JSON.stringify({ name, ...result }, null, 2)}</pre>`);
        res.end();
      })();
    } else {
      res.end;
    }
  })
  .listen(8800);
