import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form, Breadcrumb, Button } from 'react-bootstrap';
import { FaDownload, FaArrowLeft, FaFile, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive } from 'react-icons/fa';
import api from '../services/api';

const DocumentCategory = () => {
    const { categoryId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [documentTypeFilter, setDocumentTypeFilter] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState('');

    useEffect(() => {
        fetchCategoryDocuments();
    }, [categoryId, currentPage, documentTypeFilter, fileTypeFilter]);

    const fetchCategoryDocuments = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 12
            };
            
            if (documentTypeFilter) {
                params.documentType = documentTypeFilter;
            }
            
            if (fileTypeFilter) {
                params.fileType = fileTypeFilter;
            }

            const response = await api.get(`/documents/categories/${categoryId}/documents`, { params });
            setData(response.data.data);
        } catch (err) {
            setError('Failed to load category documents');
            console.error('Error fetching category documents:', err);
        } finally {
            setLoading(false);
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const clearFilters = () => {
        setDocumentTypeFilter('');
        setFileTypeFilter('');
        setCurrentPage(1);
    };

    if (loading && !data) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading documents...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Link to="/downloads" className="btn btn-primary">
                    <FaArrowLeft className="me-2" />
                    Back to Download Center
                </Link>
            </Container>
        );
    }

    const { documents, category, pagination } = data || {};

    return (
        <Container className="py-4">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/downloads" }}>
                    Download Center
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    {category?.name}
                </Breadcrumb.Item>
            </Breadcrumb>

            {/* Category Header */}
            {category && (
                <div className="text-center mb-5">
                    <div className="mb-3">
                        <i className={`${category.icon} fa-4x text-primary`}></i>
                    </div>
                    <h1 className="display-5 fw-bold mb-3">{category.name}</h1>
                    <p className="lead text-muted mb-4">{category.description}</p>
                    <Badge bg="primary" className="fs-6 px-3 py-2">
                        {documents?.length || 0} documents available
                    </Badge>
                </div>
            )}

            {/* Filters */}
            <Row className="mb-4">
                <Col md={4}>
                    <Link to="/downloads" className="btn btn-outline-secondary">
                        <FaArrowLeft className="me-2" />
                        Back to Download Center
                    </Link>
                </Col>
                <Col md={8} className="text-md-end">
                    <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                        <Form.Select
                            value={documentTypeFilter}
                            onChange={(e) => {
                                setDocumentTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{ width: 'auto' }}
                        >
                            <option value="">All Document Types</option>
                            <option value="manual">User Manual</option>
                            <option value="datasheet">Datasheet</option>
                            <option value="specification">Specification</option>
                            <option value="guide">Installation Guide</option>
                            <option value="warranty">Warranty Document</option>
                            <option value="certificate">Certificate</option>
                            <option value="other">Other</option>
                        </Form.Select>
                        
                        <Form.Select
                            value={fileTypeFilter}
                            onChange={(e) => {
                                setFileTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{ width: 'auto' }}
                        >
                            <option value="">All File Types</option>
                            <option value="pdf">PDF</option>
                            <option value="doc">Word Document</option>
                            <option value="xls">Excel Spreadsheet</option>
                            <option value="ppt">PowerPoint</option>
                            <option value="zip">ZIP Archive</option>
                        </Form.Select>
                        
                        {(documentTypeFilter || fileTypeFilter) && (
                            <Button variant="outline-secondary" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Documents Grid */}
            {documents && documents.length > 0 ? (
                <>
                    <Row>
                        {documents.map((document) => (
                            <Col lg={6} xl={4} key={document._id} className="mb-4">
                                <Card className="h-100 shadow-sm hover-shadow">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-start mb-3">
                                            <div className="me-3" style={{ fontSize: '2rem' }}>
                                                {getFileIcon(document.fileType)}
                                            </div>
                                            <div className="flex-grow-1">
                                                <Card.Title className="h5 mb-2">
                                                    {document.title}
                                                </Card.Title>
                                                <div className="mb-2">
                                                    <Badge bg={getDocumentTypeColor(document.documentType)} className="me-2">
                                                        {document.documentType}
                                                    </Badge>
                                                    <Badge bg="light" text="dark">
                                                        {document.fileType.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Card.Text className="text-muted small flex-grow-1">
                                            {document.description.substring(0, 120)}...
                                        </Card.Text>
                                        
                                        {document.tags && document.tags.length > 0 && (
                                            <div className="mb-3">
                                                {document.tags.slice(0, 3).map((tag, index) => (
                                                    <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        
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

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="d-flex justify-content-center mt-5">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    
                                    {[...Array(pagination.pages)].map((_, index) => {
                                        const page = index + 1;
                                        return (
                                            <li
                                                key={page}
                                                className={`page-item ${pagination.page === page ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        );
                                    })}
                                    
                                    <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-5">
                    <i className="fas fa-file fa-3x text-muted mb-3"></i>
                    <h3 className="text-muted">No documents found</h3>
                    <p className="text-muted">
                        {(documentTypeFilter || fileTypeFilter)
                            ? 'No documents match your current filters.'
                            : 'This category doesn\'t have any documents yet.'
                        }
                    </p>
                    {(documentTypeFilter || fileTypeFilter) && (
                        <Button variant="outline-primary" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}
        </Container>
    );
};

export default DocumentCategory;
