import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const EMBEDDING_SERVICE_URL =
    process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8000';

export const generateEmbedding = async (imagePath) => {
    try {
        console.log("imagePath", imagePath)
        const formData = new FormData();

        formData.append(
            'file',
            fs.createReadStream(imagePath)
        );

        const response = await axios.post(
            `${EMBEDDING_SERVICE_URL}/embedding`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );
        console.log("response, ", response)
        const embedding = response.data.embedding;
        console.log("embedding", embedding)
        if (!Array.isArray(embedding)) {
            throw new Error('Embedding response is not an array');
        }

        if (embedding.length !== 512) {
            throw new Error(
                `Invalid embedding dimensions. Expected 512, received ${embedding.length}`
            );
        }

        return embedding;

    } catch (error) {
        console.error(
            'Error generating embedding:',
            error.response?.data || error.message
        );

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            const connErr = new Error('Embedding service unavailable');
            connErr.code = error.code;
            throw connErr;
        }

        if (error.message && error.message.includes('Invalid embedding dimensions')) {
            throw error;
        }

        throw new Error('Failed to generate image embedding');
    }
};