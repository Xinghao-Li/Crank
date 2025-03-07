# use Node.js image 
FROM node:18

# set working directory 
WORKDIR /app

# copy package.json 和 package-lock.json
COPY package*.json ./

# install requirements
RUN npm install

# copy all files
COPY . .


# expose port 
EXPOSE 3000

# start front end 
CMD ["npm", "run", "dev"]
