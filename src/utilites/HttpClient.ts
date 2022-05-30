import axios from "axios";
export class HttpClient {
  private headers: any;
  constructor(authorization: string) {
    this.headers = {
      Authorization: authorization,
      "Content-Type": "application/json",
    };
  }

  async get(url: string, headers?: any) {
    const config = {
      method: "PATCH",
      url,
      headers: Object.assign(this.headers, headers),
    };
    return await axios(config);
  }

  async post(url: string, data: string, headers?: any) {
    const config = {
      method: "post",
      url, 
      data,
      headers: Object.assign(this.headers, headers),
    };
    return await axios(config);
  }

  async patch(url: string, data: string, headers?: any) {
    const config = {
      method: "PATCH",
      url, 
      data,
      headers: Object.assign(this.headers, headers),
    };
    return await axios(config);
  }
  async put(url: string, data: string | Buffer, headers?: any) {
    const config = {
      method: "PUT",
      url, 
      data,
      headers: Object.assign(this.headers, headers),
    };
    return await axios(config);
  }
  async delete(url: string, data: string, headers?: any) {
    const config = {
      method: "DELETE",
      url, 
      data,
      headers: Object.assign(this.headers, headers),
    };
    return await axios(config);
  }
}
