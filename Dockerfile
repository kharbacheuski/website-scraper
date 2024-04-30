FROM alpine:3.14

COPY ./ /tmp/gssg/
WORKDIR /tmp/gssg

RUN apk update
RUN apk add --update nodejs npm 
RUN apk add rsync 

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]