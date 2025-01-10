


FROM node:18

# Set the working directory inside the container
WORKDIR /home/app

# Copy project files to the container
COPY ./ /home/app/

# Install dependencies
RUN npm install

# Expose the port the server will run on
EXPOSE 3018

# Correct the CMD instruction
CMD ["npm", "run", "dev"]


