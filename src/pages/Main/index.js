import React, { useState, useEffect } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Form, SubmitButton, List } from './MainStyles';
import Container, { Icon } from '../../components/Container';
import api from '../../services/api';

const Main = () => {
  const [newRepo, setNewRepo] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = e => {
    setNewRepo(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);

    const response = await api.get(`/repos/${newRepo}`);

    const data = {
      name: response.data.full_name,
    };

    setRepositories([...repositories, data]);

    setNewRepo('');

    setLoading(false);
  };

  //Carregar os dados do localStorage
  useEffect(() => {
    const repo = localStorage.getItem('repositories');

    if (repo) {
      setRepositories(JSON.parse(repo));
    }

  }, []);

  //Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('repositories', JSON.stringify(repositories))
  }, [repositories]);

  return (
    <Container>
      <Icon>
        <FaGithubAlt />
      </Icon>

      <h1>GithubRepositories</h1>

      <Form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add repository"
          value={newRepo}
          onChange={handleInputChange}
        />

        <SubmitButton loading={loading ? 1 : 0}>
          { loading ? (
            <FaSpinner color="#FFF" size={14} />
          ) : (
            <FaPlus color="#FFF" size={14} />
          )}
        </SubmitButton>
      </Form>

      <List>
         {repositories.map(repo => (
          <li key={repo.name}>
            <span>{repo.name}</span>
            <Link to={`/repository/${encodeURIComponent(repo.name)}`}>Detalhes</Link>
          </li>
        ))}
      </List>
    </Container>
  );
};

export default Main;
