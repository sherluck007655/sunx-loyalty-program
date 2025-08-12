import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form, InputGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaDownload, FaSearch, FaFilter, FaFile, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive } from 'react-icons/fa';
import api from '../services/api';

const DownloadCenter = () => {
    const [categories, setCategories] = useState([]);
    const [featuredDocuments, setFeaturedDocuments] = useState([]);
    const [popularDocuments, setPopularDocuments] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [fileTypes, setFileTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, featuredRes, popularRes, typesRes, fileTypesRes] = await Promise.all([
                api.get('/documents/categories'),
                api.get('/documents/featured'),
                api.get('/documents/popular'),
                api.get('/documents/types'),
                api.get('/documents/file-types')
            ]);

            setCategories(categoriesRes.data.data);
            setFeaturedDocuments(featuredRes.data.data);
            setPopularDocuments(popularRes.data.data);
            setDocumentTypes(typesRes.data.data);
            setFileTypes(fileTypesRes.data.data);
        } catch (err) {
            setError('Failed to load download center content');
            console.error('Error fetching download center data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/downloads/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'pdf': return <FaFilePdf className="text-danger" />;
            case 'doc':
            case 'docx': return <FaFileWord className="text-primary" />;
            case 'xls':
            case 'xlsx': return <FaFileExcel className="text-success" />;
            case 'ppt':
            case 'pptx': return <FaFilePowerpoint className="text-warning" />;
            case 'zip':
            case 'rar': return <FaFileArchive className="text-secondary" />;
            default: return <FaFileAlt className="text-muted" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDocumentTypeColor = (type) => {
        switch (type) {
            case 'manual': return 'primary';
            case 'datasheet': return 'info';
            case 'specification': return 'warning';
            case 'guide': return 'success';
            case 'warranty': return 'danger';
            case 'certificate': return 'secondary';
            default: return 'light';
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading download center...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Header */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary mb-3">
                    <FaDownload className="me-3" />
                    Download Center
                </h1>
                <p className="lead text-muted">
                    Access all product manuals, datasheets, and technical documents
                </p>
            </div>

            {/* Search Bar */}
            <Row className="mb-5">
                <Col lg={8} className="mx-auto">
                    <Form onSubmit={handleSearch}>
                        <InputGroup size="lg">
                            <Form.Control
                                type="text"
                                placeholder="Search documents, manuals, datasheets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary" type="submit">
                                <FaSearch />
                            </button>
                        </InputGroup>
                    </Form>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Featured Documents */}
            {featuredDocuments.length > 0 && (
                <section className="mb-5">
                    <h2 className="h3 mb-4">
                        <Badge bg="warning" className="me-2">Featured</Badge>
                        Important Documents
                    </h2>
                    <Row>
                        {featuredDocuments.map((document) => (
                            <Col lg={6} xl={4} key={document._id} className="mb-4">
                                <Card className="h-100 shadow-sm hover-shadow">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-start mb-3">
                                            <div className="me-3" style={{ fontSize: '2rem' }}>
                                                {getFileIcon(document.fileType)}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        {document.categoryId?.name}
                                                    </small>
                                                </div>
                                                <Card.Title className="h5 mb-2">
                                                    {document.title}
                                                </Card.Title>
                                            </div>
                                        </div>
                                        
                                        <Card.Text className="text-muted small flex-grow-1">
                                            {document.description.substring(0, 100)}...
                                        </Card.Text>
                                        
                                        <div className="mb-3">
                                            <Badge bg={getDocumentTypeColor(document.documentType)} className="me-2">
                                                {document.documentType}
                                            </Badge>
                                            <Badge bg="light" text="dark">
                                                {document.fileType.toUpperCase()}
                                            </Badge>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <div>
                                                <small className="text-muted d-block">
                                                    {formatFileSize(document.fileSize)}
                                                </small>
                                                <small className="text-muted">
                                                    <FaDownload className="me-1" />
                                                    {document.downloadCount} downloads
                                                </small>
                                            </div>
                                            <a
                                                href={`/api/documents/${document._id}/download`}
                                                className="btn btn-primary btn-sm"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FaDownload className="me-1" />
                                                Download
                                            </a>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>
            )}

            {/* Document Categories */}
            <section className="mb-5">
                <h2 className="h3 mb-4">Document Categories</h2>
                <Row>
                    {categories.map((category) => (
                        <Col lg={6} xl={4} key={category._id} className="mb-4">
                            <Link
                                to={`/downloads/category/${category._id}`}
                                className="text-decoration-none"
                            >
                                <Card className="h-100 shadow-sm hover-shadow category-card">
                                    <Card.Body className="text-center p-4">
                                        <div className="mb-3">
                                            <i className={`${category.icon} fa-3x text-primary`}></i>
                                        </div>
                                        <Card.Title className="h5 mb-2">
                                            {category.name}
                                        </Card.Title>
                                        <Card.Text className="text-muted small mb-3">
                                            {category.description}
                                        </Card.Text>
                                        <Badge bg="primary">
                                            {category.documentCount} documents
                                        </Badge>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </section>

            {/* Popular Downloads */}
            {popularDocuments.length > 0 && (
                <section className="mb-5">
                    <h2 className="h3 mb-4">
                        <Badge bg="info" className="me-2">Popular</Badge>
                        Most Downloaded
                    </h2>
                    <Row>
                        {popularDocuments.slice(0, 6).map((document) => (
                            <Col lg={6} key={document._id} className="mb-3">
                                <Card className="shadow-sm hover-shadow">
                                    <Card.Body>
                                        <div className="d-flex align-items-center">
                                            <div className="me-3" style={{ fontSize: '1.5rem' }}>
                                                {getFileIcon(document.fileType)}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">{document.title}</h6>
                                                <div className="d-flex gap-2 mb-2">
                                                    <Badge bg={getDocumentTypeColor(document.documentType)} size="sm">
                                                        {document.documentType}
                                                    </Badge>
                                                    <Badge bg="light" text="dark" size="sm">
                                                        {document.fileType.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <small className="text-muted">
                                                    {document.categoryId?.name} • {formatFileSize(document.fileSize)}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-muted d-block">
                                                    <FaDownload className="me-1" />
                                                    {document.downloadCount}
                                                </small>
                                                <a
                                                    href={`/api/documents/${document._id}/download`}
                                                    className="btn btn-outline-primary btn-sm mt-1"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>
            )}

            {/* Quick Filters */}
            <section className="mb-5">
                <h2 className="h3 mb-4">Quick Filters</h2>
                <Row>
                    <Col md={6} className="mb-3">
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">Document Types</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex flex-wrap gap-2">
                                    {documentTypes.map((type) => (
                                        <Link
                                            key={type.value}
                                            to={`/downloads/search?documentType=${type.value}`}
                                            className="btn btn-outline-secondary btn-sm"
                                        >
                                            {type.label}
                                        </Link>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">File Types</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex flex-wrap gap-2">
                                    {fileTypes.slice(0, 6).map((type) => (
                                        <Link
                                            key={type.value}
                                            to={`/downloads/search?fileType=${type.value}`}
                                            className="btn btn-outline-secondary btn-sm"
                                        >
                                            {getFileIcon(type.value)}
                                            <span className="ms-1">{type.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>
        </Container>
    );
};

export default DownloadCenter;
