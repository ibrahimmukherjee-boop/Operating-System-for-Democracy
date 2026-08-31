FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml LICENSE README.md ./
COPY src ./src
COPY api ./api
COPY data ./data
COPY schemas ./schemas

RUN pip install --no-cache-dir -e .

EXPOSE 8742

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8742"]
