import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Table, Button, Container, FormGroup,
    Modal, ModalHeader, ModalBody, ModalFooter,
    Spinner, Alert
} from "reactstrap";

const API_URL = "/api/books";

class Library extends React.Component {
    state = {
        data: [],
        loading: true,
        error: null,
        modalActualizar: false,
        modalInsertar: false,
        form: {
            id: "",
            bookName: "",
            author: "",
            ISBN: "",
            realeaseDate: "",
            available: false,
        },
    };

    componentDidMount() {
        this.fetchBooks();
    }

    fetchBooks = async () => {
        try {
            this.setState({ loading: true, error: null });
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            this.setState({ data, loading: false });
        } catch (error) {
            this.setState({ error: error.message, loading: false });
        }
    };

    mostrarModalActualizar = (dato) => {
        this.setState({
            form: dato,
            modalActualizar: true,
        });
    };

    cerrarModalActualizar = () => {
        this.setState({ modalActualizar: false });
    };

    mostrarModalInsertar = () => {
        this.setState({
            form: {
                id: "",
                bookName: "",
                author: "",
                ISBN: "",
                realeaseDate: "",
                available: false,
            },
            modalInsertar: true,
        });
    };

    cerrarModalInsertar = () => {
        this.setState({ modalInsertar: false });
    };

    editar = async (dato) => {
        try {
            this.setState({ loading: true, error: null });
            const response = await fetch(`${API_URL}/${dato.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dato),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            await this.fetchBooks();
            this.setState({ modalActualizar: false });
        } catch (error) {
            this.setState({ error: error.message, loading: false });
        }
    };

    eliminar = async (dato) => {
        let opcion = window.confirm(`Are you sure you want to delete "${dato.bookName}"?`);
        if (opcion) {
            try {
                this.setState({ loading: true });
                const response = await fetch(`${API_URL}/${dato.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                await this.fetchBooks();
            } catch (error) {
                this.setState({ error: error.message, loading: false });
            }
        }
    };

    insertar = async () => {
        try {
            const newBook = { ...this.state.form };
            delete newBook.id;

            this.setState({ loading: true });
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBook),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            await this.fetchBooks();
            this.setState({ modalInsertar: false });
        } catch (error) {
            this.setState({ error: error.message, loading: false });
        }
    };

    handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
            form: {
                ...this.state.form,
                [e.target.name]: value,
            },
        });
    };

    formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    render() {
        const { loading, error, data } = this.state;

        return (
            <>
                <Container>
                    <h1>Library Management System</h1>
                    <br />
                    <Button color="success" onClick={this.mostrarModalInsertar}>Add New Book</Button>
                    <br />
                    <br />

                    {error && <Alert color="danger">Error: {error}</Alert>}

                    {loading && !error && (
                        <div className="text-center my-3">
                            <Spinner color="primary" />
                            <p>Loading books...</p>
                        </div>
                    )}

                    {!loading && (
                        <Table striped responsive>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Book Name</th>
                                <th>Author</th>
                                <th>ISBN</th>
                                <th>Release Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.map((dato) => (
                                <tr key={dato.id}>
                                    <td>{dato.id}</td>
                                    <td>{dato.bookName}</td>
                                    <td>{dato.author}</td>
                                    <td>{dato.ISBN}</td>
                                    <td>{this.formatDate(dato.realeaseDate)}</td>
                                    <td>
                                            <span className={`badge bg-${dato.available ? 'success' : 'danger'}`}>
                                                {dato.available ? "Available" : "Not Available"}
                                            </span>
                                    </td>
                                    <td>
                                        <Button color="primary" size="sm" className="me-2" onClick={() => this.mostrarModalActualizar(dato)}>
                                            Edit
                                        </Button>
                                        <Button color="danger" size="sm" onClick={() => this.eliminar(dato)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Container>

                {/* Add Book Modal */}
                <Modal isOpen={this.state.modalInsertar}>
                    <ModalHeader>Add New Book</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <label>Book Name:</label>
                            <input className="form-control" name="bookName" type="text" onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <label>Author:</label>
                            <input className="form-control" name="author" type="text" onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <label>ISBN:</label>
                            <input className="form-control" name="ISBN" type="text" onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <label>Release Date:</label>
                            <input className="form-control" name="realeaseDate" type="date" onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup check className="mb-3">
                            <label className="form-check-label">
                                <input
                                    className="form-check-input"
                                    name="available"
                                    type="checkbox"
                                    onChange={this.handleChange}
                                    checked={this.state.form.available || false}
                                />
                                Available
                            </label>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.insertar}>Add</Button>
                        <Button color="secondary" onClick={this.cerrarModalInsertar}>Cancel</Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Book Modal */}
                <Modal isOpen={this.state.modalActualizar}>
                    <ModalHeader>Edit Book</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <label>ID:</label>
                            <input className="form-control" readOnly type="text" value={this.state.form.id} />
                        </FormGroup>
                        <FormGroup>
                            <label>Book Name:</label>
                            <input
                                className="form-control"
                                name="bookName"
                                type="text"
                                onChange={this.handleChange}
                                value={this.state.form.bookName}
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Author:</label>
                            <input
                                className="form-control"
                                name="author"
                                type="text"
                                onChange={this.handleChange}
                                value={this.state.form.author}
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>ISBN:</label>
                            <input
                                className="form-control"
                                name="ISBN"
                                type="text"
                                onChange={this.handleChange}
                                value={this.state.form.ISBN}
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Release Date:</label>
                            <input
                                className="form-control"
                                name="realeaseDate"
                                type="date"
                                onChange={this.handleChange}
                                value={this.formatDate(this.state.form.realeaseDate)}
                            />
                        </FormGroup>
                        <FormGroup check className="mb-3">
                            <label>
                                <input
                                    type="checkbox"
                                    name="available"
                                    className="form-check-input"
                                    onChange={this.handleChange}
                                    checked={this.state.form.available || false}
                                />
                                Available
                            </label>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.editar(this.state.form)}>Update</Button>
                        <Button color="secondary" onClick={this.cerrarModalActualizar}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

export default Library;