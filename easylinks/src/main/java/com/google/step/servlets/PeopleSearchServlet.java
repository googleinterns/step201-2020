package com.google.step.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responsible for People Search & email sending. */
@WebServlet("/~who/*")
public class PeopleSearchServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String[] requestUrls = request.getRequestURI().split("/");
    if (requestUrls[2].isEmpty()) {
      response.getWriter().println("Invalid input");
      return;
    }
    response.sendRedirect("/people.html?name=" + requestUrls[2]);
  }
}