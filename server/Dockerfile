# use python image 
FROM python:3.10

# set working directory 
WORKDIR /app

# copy requirements 
COPY requirements.txt ./

# install requirements 
RUN pip install --no-cache-dir -r /app/requirements.txt

# copy all code 
COPY . .

# expose port 5000
EXPOSE 5000

# start backend
CMD ["python", "server.py"]
