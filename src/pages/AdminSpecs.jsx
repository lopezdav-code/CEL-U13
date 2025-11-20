import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminSpecs = () => {
    const [documentation, setDocumentation] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the functional specifications markdown file
        fetch('/FUNCTIONAL_SPECIFICATIONS.md')
            .then(response => response.text())
            .then(text => {
                setDocumentation(text);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading specifications:', error);
                setLoading(false);
            });
    }, []);

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([documentation], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = 'FUNCTIONAL_SPECIFICATIONS.md';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Filter documentation based on search term
    // Note: Simple line filtering might break markdown structure (images, headers).
    // For now, we'll just filter if the term is found, but rendering partial markdown is tricky.
    // A better approach for specs with images is to highlight or just show the whole thing if match found.
    // But let's keep it simple: if search term exists, we try to find relevant sections or just show all.
    // Actually, let's just filter lines for text content, but images might get lost if we just filter lines.
    // Let's stick to the same logic as AdminDocs for consistency, but be aware of limitations.
    const filteredDocumentation = searchTerm
        ? documentation
            .split('\n')
            .filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()) || line.startsWith('![')) // Keep images
            .join('\n')
        : documentation;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-green-600"></div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Spécifications Fonctionnelles - Admin</title>
                <meta name="description" content="Spécifications fonctionnelles de l'application CEL U13" />
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-green-600" />
                            Spécifications Fonctionnelles
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Guide visuel et fonctionnel de l'application
                        </p>
                    </div>
                    <Button onClick={handleDownload} className="gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger (MD)
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Rechercher dans les spécifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Documentation Content */}
                <div className="bg-white rounded-lg shadow-md border p-6 sm:p-8">
                    <div className="prose prose-slate max-w-none
            prose-headings:text-gray-900
            prose-h1:text-3xl prose-h1:font-bold prose-h1:border-b prose-h1:pb-2 prose-h1:mb-4
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
            prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:text-gray-100
            prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:my-6
            prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:pl-4 prose-blockquote:italic
          ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {filteredDocumentation}
                        </ReactMarkdown>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AdminSpecs;
